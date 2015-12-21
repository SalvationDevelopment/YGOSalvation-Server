--ブラッドストーム
function c1055.initial_effect(c)
	--attackup
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetValue(c1055.atkval)
	c:RegisterEffect(e1)
	--destroy
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(1055,0))
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCondition(c1055.descon)
	e2:SetTarget(c1055.destg)
	e2:SetOperation(c1055.desop)
	c:RegisterEffect(e2)
end
function c1055.cfilter(c)
	return c:IsFaceup()
end
function c1055.atkval(e,c)
	return Duel.GetMatchingGroupCount(c1055.cfilter,c:GetControler(),LOCATION_MZONE,0,nil)*100
end
function c1055.descon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c1055.cfilter,tp,LOCATION_MZONE,0,3,nil)
end
function c1055.filter(c)
	return c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsDestructable()
end
function c1055.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsControler(1-tp) and c1055.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c1055.filter,tp,0,LOCATION_ONFIELD,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c1055.filter,tp,0,LOCATION_ONFIELD,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end
function c1055.desop(e,tp,eg,ep,ev,re,r,rp)
	if not Duel.IsExistingMatchingCard(c1055.cfilter,tp,LOCATION_MZONE,0,3,nil) then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end
