--聖霊獣 ラムペンタ
function c80100229.initial_effect(c)
	--to grave
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80100229,1))
	e1:SetCategory(CATEGORY_TOGRAVE+CATEGORY_REMOVE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetTarget(c80100229.tgtg)
	e1:SetOperation(c80100229.tgop)
	c:RegisterEffect(e1)
	-- 
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e2:SetOperation(c80100229.regop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e3:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e3:SetCondition(c80100229.excon)
	c:RegisterEffect(e3)
end
function c80100229.tgfilter(c,tp)
	return c:IsSetCard(0xb5) and c:IsAbleToRemove() and 
		Duel.IsExistingMatchingCard(c80100229.tgfilter1,tp,LOCATION_DECK,0,1,nil,c:GetRace())
end
function c80100229.tgfilter1(c,race)
	return c:IsSetCard(0xb5) and c:IsRace(race) and c:IsAbleToGrave()
end
function c80100229.tgtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80100229.tgfilter,tp,LOCATION_EXTRA,0,1,nil,tp) end
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,nil,1,tp,LOCATION_EXTRA)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK)
end
function c80100229.tgop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c80100229.tgfilter,tp,LOCATION_EXTRA,0,1,1,nil,tp)
	local tc=g:GetFirst()
	if tc and Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)~=0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local g1=Duel.SelectMatchingCard(tp,c80100229.tgfilter1,tp,LOCATION_DECK,0,1,1,nil,tc:GetRace())
		local tc1=g1:GetFirst()
		Duel.SendtoGrave(tc1,REASON_EFFECT)
	end
end
function c80100229.regop(e,tp,eg,ep,ev,re,r,rp)
	Duel.RegisterFlagEffect(tp,80100229,RESET_PHASE+PHASE_END,0,1)
end
function c80100229.excon(e)
	return Duel.GetFlagEffect(tp,80100229)~=0
end