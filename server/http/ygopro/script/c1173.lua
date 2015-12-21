--ワンダー・ワンド
--FIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXEDFIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXED
--FIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXEDFIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXED
--FIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXEDFIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXED
--FIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXEDFIXEDFIXEDFIXEDIFEDFIXEDFIXEDFIXED
function c1173.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c1173.target)
	e1:SetOperation(c1173.operation)
	c:RegisterEffect(e1)
	--Atk up
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_EQUIP)
	e2:SetCode(EFFECT_UPDATE_ATTACK)
	e2:SetValue(500)
	c:RegisterEffect(e2)
	--Equip limit
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_EQUIP_LIMIT)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e3:SetValue(c1173.eqlimit)
	c:RegisterEffect(e3)
	--draw
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(1173,0))
	e4:SetCategory(CATEGORY_DRAW)
	e4:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCost(c1173.drcost)
	e4:SetTarget(c1173.drtg)
	e4:SetOperation(c1173.drop)
	c:RegisterEffect(e4)
end
function c1173.eqlimit(e,c)
	return true
end
function c1173.filter(c)
	return c:IsFaceup()
end
function c1173.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c1173.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c1173.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	Duel.SelectTarget(tp,c1173.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,e:GetHandler(),1,0,0)
end
function c1173.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if e:GetHandler():IsRelateToEffect(e) and tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.Equip(tp,e:GetHandler(),tc)
	end
end
function c1173.drcost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsAbleToGraveAsCost() and c:GetControler()==c:GetEquipTarget():GetControler()
		and c:GetEquipTarget():IsAbleToGraveAsCost() end
	local g=Group.FromCards(c,c:GetEquipTarget())
	Duel.SendtoGrave(g,REASON_COST)
end
function c1173.drtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,2) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(2)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,2)
end
function c1173.drop(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
end
