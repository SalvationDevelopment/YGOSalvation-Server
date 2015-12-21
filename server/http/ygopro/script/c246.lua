-- Slime Ball
function c246.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetTarget(c246.target)
	e1:SetOperation(c246.activate)
	c:RegisterEffect(e1)
end
function c246.filter(c,tp)
	return c:IsFaceup() and c:IsType(TYPE_EFFECT) and c:GetSummonPlayer()==tp and c:IsDestructable()
end
function c246.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return eg:IsExists(c246.filter,1,nil,1-tp) end
	Duel.SetTargetCard(eg)
	local g=eg:Filter(c246.filter,nil,1-tp)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end

function c246.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	local atk=tc:GetAttack()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) and tc:IsDestructable() then
		Duel.Destroy(tc,REASON_EFFECT)
		Duel.Recover(1-tp,atk,REASON_EFFECT)
	end
end
