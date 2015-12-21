--Comic Hand
function c13790570.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_CONTROL+CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c13790570.target)
	e1:SetOperation(c13790570.operation)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetCode(EFFECT_SELF_DESTROY)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCondition(c13790570.descon)
	c:RegisterEffect(e2)
	--equip limit
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_EQUIP_LIMIT)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e3:SetValue(c13790570.eqlimit)
	c:RegisterEffect(e3)
	--control
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_EQUIP)
	e4:SetCode(EFFECT_SET_CONTROL)
	e4:SetValue(c13790570.ctval)
	c:RegisterEffect(e4)
	--direct attack
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_EQUIP)
	e5:SetCode(EFFECT_DIRECT_ATTACK)
	e5:SetCondition(c13790570.dircon)
	c:RegisterEffect(e5)
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_EQUIP)
	e6:SetCode(EFFECT_ADD_TYPE)
	e6:SetValue(TYPE_TOON)
	c:RegisterEffect(e6)
end
function c13790570.desfilter(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c13790570.descon(e)
	return not Duel.IsExistingMatchingCard(c13790570.desfilter,e:GetHandlerPlayer(),LOCATION_ONFIELD,0,1,nil)
end
function c13790570.filter(c)
	return c:IsFaceup() and c:IsControlerCanBeChanged()
end
function c13790570.eqlimit(e,c)
	return e:GetHandlerPlayer()~=c:GetControler() or e:GetHandler():GetEquipTarget()==c
end
function c13790570.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c13790570.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790570.filter,tp,0,LOCATION_MZONE,1,nil) and
	Duel.IsExistingMatchingCard(c13790570.desfilter,e:GetHandlerPlayer(),LOCATION_ONFIELD,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONTROL)
	local g=Duel.SelectTarget(tp,c13790570.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_CONTROL,g,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,e:GetHandler(),1,0,0)
end
function c13790570.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		Duel.Equip(tp,c,tc)
	end
end
function c13790570.atkfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_TOON)
end
function c13790570.dircon(e)
	return not Duel.IsExistingMatchingCard(c13790570.atkfilter,e:GetHandlerPlayer(),0,LOCATION_MZONE,1,nil)
end
function c13790570.ctval(e,c)
	return e:GetHandlerPlayer()
end
