--森羅の実張り ピース
function c80800015.initial_effect(c)
	--deck check
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80800015,0))
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c80800015.target)
	e1:SetOperation(c80800015.operation)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e2)
	--special summon
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80800015,1))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCondition(c80800015.spcon)
	e3:SetCost(c80800015.spcost)
	e3:SetTarget(c80800015.sptg)
	e3:SetOperation(c80800015.spop)
	c:RegisterEffect(e3)
	--
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e4:SetCode(EVENT_CONFIRM_DECKTOP)
	e4:SetRange(LOCATION_DECK)
	e4:SetLabelObject(e3)
	e4:SetCondition(c80800015.chk)
	c:RegisterEffect(e4)
end
function c80800015.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0 end
end
function c80800015.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)==0 then return end
	Duel.ConfirmDecktop(tp,1)
	local g=Duel.GetDecktopGroup(tp,1)
	local tc=g:GetFirst()
	if tc:IsRace(RACE_PLANT) and tc:IsAbleToHand() then
		Duel.DisableShuffleCheck()
		Duel.SendtoGrave(g,nil,REASON_EFFECT)
	else
		Duel.MoveSequence(tc,1)
	end
end
function c80800015.spcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:IsPreviousLocation(LOCATION_DECK) 
	and	re==e:GetLabelObject()
end
function c80800015.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80800015)==0 end
	Duel.RegisterFlagEffect(tp,80800015,RESET_PHASE+PHASE_END,0,1)
end
function c80800015.filter(c,e,tp)
	return c:IsLevelBelow(4) and c:IsRace(RACE_PLANT) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80800015.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80800015.filter(chkc,e,tp) end
	if chk==0 then return Duel.IsExistingTarget(c80800015.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) 
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80800015.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,g:GetCount(),0,0)
end
function c80800015.spop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end
function c80800015.chk(e,tp,eg,ep,ev,re,r,rp)
	if  eg:IsContains(e:GetHandler()) then
		e:GetLabelObject():SetLabelObject(re)
	end
end