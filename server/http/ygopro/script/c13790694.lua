--Frightfur March
function c13790694.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE+CATEGORY_NEGATE+CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_BECOME_TARGET)
	e1:SetCondition(c13790694.condition)
	e1:SetTarget(c13790694.target)
	e1:SetOperation(c13790694.activate)
	c:RegisterEffect(e1)
end
function c13790694.filter(c,tp)
	return c:IsFaceup() and c:IsControler(tp) and c:IsLocation(LOCATION_MZONE) and (c:IsSetCard(0xad) or c:IsHasEffect(36693940))
end
function c13790694.ffilter(c,e,tp)
	return c:IsType(TYPE_FUSION) and c:GetLevel()>=8
		and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_FUSION,tp,false,false) and c:IsSetCard(0xad)
end
function c13790694.condition(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp and eg:IsExists(c13790694.filter,1,nil,tp) and Duel.IsChainDisablable(ev)
end
function c13790694.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DISABLE,eg,1,0,0)
	if re:GetHandler():IsDestructable() and re:GetHandler():IsRelateToEffect(re) then
		Duel.SetOperationInfo(0,CATEGORY_DESTROY,re:GetHandler(),1,0,0)
		Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,0)
	end
end
function c13790694.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateEffect(ev)
	if re:GetHandler():IsRelateToEffect(re) and Duel.Destroy(re:GetHandler(),REASON_EFFECT) then
		Duel.BreakEffect()
		if eg:IsExists(c13790694.filter,1,nil,tp) and Duel.IsExistingMatchingCard(c13790694.ffilter,tp,LOCATION_EXTRA,0,1,nil,e,tp) 
		and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and Duel.SelectYesNo(tp,aux.Stringid(13790694,0)) then
			tc=eg:Select(tp,1,1,nil):GetFirst()
			Duel.SendtoGrave(tc,REASON_COST)
				local g=Duel.SelectMatchingCard(tp,c13790694.ffilter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp)
				local tc2=g:GetFirst()
				if Duel.SpecialSummon(tc2,SUMMON_TYPE_FUSION,tp,tp,false,false,POS_FACEUP)~=0 then
				
				local e1=Effect.CreateEffect(e:GetHandler())
				e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
				e1:SetRange(LOCATION_MZONE)
				e1:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
				e1:SetCode(EVENT_PHASE+PHASE_END)
				e1:SetOperation(c13790694.desop)
				e1:SetLabelObject(tc2)
				e1:SetCountLimit(1)
				tc2:RegisterEffect(e1)
				
			end
		end
	end
end
function c13790694.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	if Duel.GetTurnPlayer()~=tp then return false end
	Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
end
