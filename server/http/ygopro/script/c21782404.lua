--Red-Eyes Burn
function c21782404.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetCode(EVENT_DESTROYED)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCountLimit(1,21782404)
	e1:SetCondition(c21782404.condition)
	e1:SetTarget(c21782404.target)
	e1:SetOperation(c21782404.operation)
	c:RegisterEffect(e1)
end
function c21782404.filter(c,tp)
	return c:IsSetCard(0x3b) and c:IsType(TYPE_MONSTER)
end
function c21782404.condition(e,tp,eg,ep,ev,re,r,rp,chk)
	return eg:IsExists(c21782404.filter,1,nil,tp)
end
function c21782404.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return eg:IsContains(chkc) and c21782404.filter(chkc,e,tp) end
	if chk==0 then return eg:IsExists(c21782404.filter,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local g=eg:FilterSelect(tp,c21782404.filter,1,1,nil,e,tp)
	Duel.SetTargetCard(g)
end
function c21782404.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	Duel.Damage(tp,tc:GetBaseAttack(),REASON_EFFECT)
	Duel.Damage(1-tp,tc:GetBaseAttack(),REASON_EFFECT)
end
