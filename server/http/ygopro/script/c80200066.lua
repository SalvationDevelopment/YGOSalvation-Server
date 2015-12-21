--スクラップ・ファクトリー
function c80200066.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--atkup
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTargetRange(LOCATION_MZONE,LOCATION_MZONE)
	e2:SetCode(EFFECT_UPDATE_ATTACK)
	e2:SetTarget(aux.TargetBoolFunction(Card.IsSetCard,0x24))
	e2:SetValue(200)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_UPDATE_DEFENCE)
	c:RegisterEffect(e3)
	--special summon
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80200066,0))
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCondition(c80200066.spcon)
	e4:SetTarget(c80200066.sptg)
	e4:SetOperation(c80200066.spop)
	c:RegisterEffect(e4)
end
function c80200066.filter(c,tp)
	return c:IsType(TYPE_MONSTER) and c:IsSetCard(0x24) and bit.band(c:GetReason(),0x41)==0x41 and c:GetPreviousControler()==tp
		and c:IsPreviousLocation(LOCATION_MZONE) and c:IsPreviousPosition(POS_FACEUP)
end
function c80200066.spcon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c80200066.filter,1,nil,tp)
end
function c80200066.spfilter(c,e,tp)
	return c:IsSetCard(0x24) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80200066.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80200066)==0 and e:GetHandler():IsRelateToEffect(e) 
	and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
	and Duel.IsExistingMatchingCard(c80200066.spfilter,tp,LOCATION_DECK,0,1,nil,e,tp)  end	
	Duel.RegisterFlagEffect(tp,80200066,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c80200066.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<1 or not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80200066.spfilter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end