--幻獣機サーバルホーク
function c80600027.initial_effect(c)
	--Cannot attack directly
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_DIRECT_ATTACK)
	c:RegisterEffect(e1)
	--cannot attack
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_CANNOT_ATTACK)
	e2:SetCondition(c80600027.atcon)
	c:RegisterEffect(e2)
	--level
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_UPDATE_LEVEL)
	e3:SetValue(c80600027.lvval)
	c:RegisterEffect(e3)
	--
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e4:SetCondition(c80600027.indcon)
	e4:SetValue(1)
	c:RegisterEffect(e4)
	local e5=e3:Clone()
	e5:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	c:RegisterEffect(e5)
	--banish
	local e6=Effect.CreateEffect(c)
	e6:SetCategory(CATEGORY_REMOVE)
	e6:SetType(EFFECT_TYPE_IGNITION)
	e6:SetRange(LOCATION_MZONE)
	e6:SetCountLimit(1)
	e6:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e6:SetCost(c80600027.bancost)
	e6:SetTarget(c80600027.bantg)
	e6:SetOperation(c80600027.banop)
	c:RegisterEffect(e6)
end
function c80600027.atcon(e)
	local tp=e:GetHandler():GetControler()
	local g=Duel.GetMatchingGroup(Card.IsType,tp,LOCATION_GRAVE,0,nil,TYPE_MONSTER)
	return g:GetCount()>0 and not g:IsExists(Card.IsSetCard,1,nil,0x101b)
end
function c80600027.lvval(e,c)
	local tp=c:GetControler()
	local lv=0
	for i=0,4 do
		local tc=Duel.GetFieldCard(tp,LOCATION_MZONE,i)
		if tc and tc:IsCode(31533705) then lv=lv+tc:GetLevel() end
	end
	return lv
end
function c80600027.indcon(e)
	return Duel.IsExistingMatchingCard(Card.IsType,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil,TYPE_TOKEN)
end
function c80600027.bancost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,Card.IsType,1,nil,TYPE_TOKEN) end
	local g=Duel.SelectReleaseGroup(tp,Card.IsType,1,1,nil,TYPE_TOKEN)
	Duel.Release(g,REASON_COST)
end
function c80600027.banfilter(c)
	return c:IsAbleToRemove()
end
function c80600027.bantg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return c80600027.banfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80600027.banfilter,tp,LOCATION_GRAVE,LOCATION_GRAVE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectTarget(tp,c80600027.banfilter,tp,LOCATION_GRAVE,LOCATION_GRAVE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_REMOVE,g,1,0,0)
end
function c80600027.banop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
	end
end