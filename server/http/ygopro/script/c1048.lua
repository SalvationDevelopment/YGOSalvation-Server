--テレキアタッカー
function c1048.initial_effect(c)
	--destroy replace
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_DESTROY_REPLACE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTarget(c1048.destg)
	e1:SetValue(c1048.value)
	e1:SetOperation(c1048.desop)
	c:RegisterEffect(e1)
end
function c1048.dfilter(c)
	return c:IsLocation(LOCATION_MZONE) and c:IsFaceup() and not c:IsReason(REASON_REPLACE)
end
function c1048.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return not eg:IsContains(e:GetHandler())
		and Duel.CheckLPCost(tp,500) and eg:IsExists(c1048.dfilter,1,nil) end
	if Duel.SelectYesNo(tp,aux.Stringid(1048,0)) then
		Duel.PayLPCost(tp,500)
		return true
	else return false end
end
function c1048.value(e,c)
	return c:IsLocation(LOCATION_MZONE) and c:IsFaceup() and not c:IsReason(REASON_REPLACE)
end
function c1048.desop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT+REASON_REPLACE)
end
